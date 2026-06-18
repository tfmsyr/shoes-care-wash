<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use RuntimeException;

abstract class Controller
{
    public function uploadToS3(UploadedFile $file, string $folder): string
    {
        $folder     = trim($folder, '/');
        $extension  = $file->getClientOriginalExtension();
        $fileName   = Str::uuid() . '.' . $extension;
        $filePath   = "shoescare/{$folder}/{$fileName}";
        Storage::disk('s3')->putFileAs("shoescare/{$folder}", $file, $fileName, 'public');
        return Storage::disk('s3')->url($filePath);
    }

    public function deleteFromS3(string $fileUrl): void
    {
        $parsedUrl = parse_url($fileUrl);
        $filePath = ltrim($parsedUrl['path'], '/');
        $bucketName = 'vras/shoescare/';
        if (Str::startsWith($filePath, $bucketName)) {
            $filePath = Str::after($filePath, $bucketName);
        }
        if (Storage::disk('s3')->exists($filePath)) {
            Storage::disk('s3')->delete($filePath);
        }
    }

    //for client
    public function templateOtp($nohp,$otp): array
    {
        $token = config('services.wa.token');
        $endpoint = config('services.wa.endpoint');
        $templateId = config('services.wa.template_id');
        $countryCode = config('services.wa.country_code', '62');

        if (!$token) {
            throw new RuntimeException('TOKEN_WA belum diatur pada environment backend.');
        }

        if (!$templateId) {
            throw new RuntimeException('WA_TEMPLATE_OTP_ID belum diatur.');
        }

        $response = Http::withHeaders([
            'Authorization' => $token,
        ])
            ->asForm()
            ->timeout(20)
            ->post($endpoint, [
                'target' => $nohp . '|' . $otp,
                'type-message' => 'template',
                'template' => $templateId,
                'delay' => '1',
                'countryCode' => $countryCode,
            ]);

        $payload = $response->json();

        if (!$response->successful()) {
            Log::error('Gagal mengirim OTP WhatsApp', [
                'phone' => $nohp,
                'status' => $response->status(),
                'response' => $response->body(),
            ]);

            throw new RuntimeException('Gateway WhatsApp gagal mengirim OTP.');
        }

        if (is_array($payload) && array_key_exists('status', $payload) && !$payload['status']) {
            Log::error('Gateway WhatsApp menolak OTP', [
                'phone' => $nohp,
                'response' => $payload,
            ]);

            $message = $payload['reason'] ?? $payload['message'] ?? 'Gateway WhatsApp menolak OTP.';
            throw new RuntimeException($message);
        }

        return is_array($payload) ? $payload : ['success' => true];
    }

}
