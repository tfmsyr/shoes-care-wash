<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\UserLoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UserOtpRequest;
use App\Http\Requests\UserOtpVerifyRequest;
use App\Http\Requests\UserResetRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use App\Models\Company;
use App\Models\User;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use DB;
use Carbon\Carbon;
class AuthController extends Controller
{
    public function login(UserLoginRequest $request): UserResource
    {
        $data= $request->validated();
        $credentials           = $request->only('phone', 'password');
        $credentials['status'] = 1;
        $user                  = Auth::attempt($credentials);
        if (!$user) {
            throw new HttpResponseException(response([
                "errors" => [
                    "message" => [
                        "phone or password wrong"
                    ]
                ]
            ], 401));
        }
        $auth    = User::where('phone',$data['phone'])->with('company','role')->first();
        $token   = $auth->createToken('auth_token')->plainTextToken;
        $auth->token = $token;
        return new UserResource($auth);
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();
        try {
            DB::beginTransaction();
            $company = new Company();
            $company->name              = $data['business_name'];
            $company->address           = $data['business_address'];
            $company->status            = 1;
            $company->save();

            $query = new User();
            $query->company_id           = $company->id;
            $query->name                 = $data['name'];
            $query->phone                = $data['phone'];
            $query->role_id              = 3;
            $query->status               = 1;
            $query->password             = Hash::make($data['password']);
            $query->save();
            DB::commit();
            $query->load('company','role');
            return (new UserResource($query))->response()->setStatusCode(201);
        }catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'data' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function requestOtp(UserOtpRequest $request): UserResource|JsonResponse
    {
        $data = $request->validated();
        $user = User::where('phone',$data['phone'])->where('status',1)->first();
        if (!$user) {
            throw new HttpResponseException(response([
                "errors" => [
                    "message" => [
                        "phone not found"
                    ]
                ]
            ], 401));
        }
        try {
            DB::transaction(function () use ($data, $user) {
                $otp = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
                $expiresAt = Carbon::now()->addMinutes(10);

                DB::table('password_resets')
                    ->where('phone', $data['phone'])
                    ->where('is_used', false)
                    ->update([
                        'is_used' => true,
                        'updated_at' => now(),
                    ]);

                DB::table('password_resets')->insert([
                    'phone' => $data['phone'],
                    'otp_code' => $otp,
                    'expires_at' => $expiresAt,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $this->templateOtp($user->phone, $otp);
            });

            return new UserResource($user);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim OTP. Silakan coba lagi.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    public function verifyOtp(UserOtpVerifyRequest $request): JsonResponse
    {
        $data = $request->validated();
        $otpData = DB::table('password_resets')
            ->where('phone', $data['phone'])
            ->where('otp_code', $data['otp_code'])
            ->where('is_used', false)
            ->first();

        if (!$otpData) {
            return response()->json([
                'success' => false,
                'message' => 'OTP invalid'
            ], 400);
        }

        if (Carbon::parse($otpData->expires_at)->isPast()) {
            return response()->json([
                'success' => false,
                'message' => 'OTP expired'
            ], 400);
        }
        return response()->json([
            'success' => true,
            'message' => 'OTP valid'
        ])->setStatusCode(200);
    }

    public function resetPassword(UserResetRequest $request): JsonResponse
    {
        $data = $request->validated();

        $otpData = DB::table('password_resets')
            ->where('phone', $data['phone'])
            ->where('otp_code', $data['otp_code'])
            ->where('is_used', false)
            ->first();

        if (!$otpData) {
            return response()->json([
                'success' => false,
                'message' => 'OTP invalid'
            ], 400);
        }

        if (Carbon::parse($otpData->expires_at)->isPast()) {
            return response()->json([
                'success' => false,
                'message' => 'OTP expired'
            ], 400);
        }

        User::where('phone', $data['phone'])->update([
            'password' => Hash::make($data['password']),
        ]);

        DB::table('password_resets')
            ->where('id', $otpData->id)
            ->update(['is_used' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil direset. Silahkan Login ulang'
        ])->setStatusCode(200);
    }
}
