<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfilUpdateRequest;
use App\Http\Requests\UserChangePasswordRequest;
use App\Http\Requests\UserChangePhotoRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ProfilController extends Controller
{
    public function get(Request $request): UserResource
    {
        $user    = User::with('company','role')->find($request->user()->id);
        return new UserResource($user);
    }

    public function update(ProfilUpdateRequest $request): UserResource|JsonResponse
    {
        $data = $request->validated();
        $user = Auth::user();

        if (isset($data['name'])) {
            $user->name = $data['name'];
        }
        if (isset($data['nik'])) {
            $user->nik = $data['nik'];
        }
        if (isset($data['phone'])) {
            $user->phone = $data['phone'];
        }
        if (isset($data['email'])) {
            $user->email = $data['email'];
        }
        $user->save();
        $user->load('company','role');
        return new UserResource($user);
    }

    public function changePassword(UserChangePasswordRequest $request): UserResource|JsonResponse
    {
        $data = $request->validated();
        $user = Auth::user();

        if (!Hash::check($data['old_password'], $user->password)) {
           return response()->json([
                'message' => 'Old password is incorrect.',
            ], 403);
        }

        $user->password = Hash::make($data['new_password']);
        $user->save();
        $user->load('company','role');

        return new UserResource($user);
    }
    public function changePhoto(UserChangePhotoRequest $request): UserResource|JsonResponse
    {
        $data = $request->validated();
        $user = Auth::user();
        if ($user->photo != 'https://is3.cloudhost.id/vras/shoescare/users/no_img.png') {
            $this->deleteFromS3($user->photo);
        }
        $url = $this->uploadToS3($request->file('photo'), 'users');
        $user->photo = $url;
        $user->save();
        return new UserResource($user);
    }

    public function logout(Request $request): JsonResponse {
        $user = Auth::user();
        $user->save();
        return response()->json([
            "data" => true
        ])->setStatusCode(200);
    }
}
