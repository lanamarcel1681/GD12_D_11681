<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Contents;
use App\Models\User;
use App\Models\Watch_later;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class Watch_laterController extends Controller
{
    public function index()
    {
        $watch_later = Watch_later::inRandomOrder()->get();

        return response([
            'message' => 'All Contents Retrieved',
            'data' => $watch_later
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function showWatch_laterbyUser($id) {
        $user = User::find($id);
        if(!$user){
            return response([
                'message' => 'User Not Found',
                'data' => null
            ],404);
        }

        $watch_later = Watch_later::with('content') // Pastikan ada relasi 'content'
        ->where('id_user', $id)
        ->get();

        return response([
            'message' => 'Contents of '.$user->name.' Retrieved',
            'data' => $watch_later
        ],200);
    }


    public function store(Request $request)
    {
        $validate = Validator::make($request->all(), [
            'id_content' => 'required|integer|exists:contents,id', // Validasi id_content
        ]);

        if ($validate->fails()) {
            return response(['message' => $validate->errors()], 400);
        }

        $idUser = Auth::id(); // Ambil ID user yang sedang login

        if (!$idUser) {
            return response([
                'message' => 'User Not Authenticated',
                'status' => 'error'
            ], 401);
        }

        $contentOwner = Contents::where('id', $request->id_content)->value('id_user');

        if ($contentOwner == $idUser) {
            return response([
                'message' => "Can't add your content to watch later",
                'status' => 'error',
            ], 403); // Forbidden status
        }

        // Cek jika konten sudah ada di watch later
        $existingWatchLater = Watch_later::where('id_user', $idUser)
            ->where('id_content', $request->id_content)
            ->first();

        if ($existingWatchLater) {
            return response([
                'message' => 'Video Already in Watch Later',
                'status' => 'error'
            ], 409); // Conflict status
        }

        // Simpan data baru ke tabel watch_later
        $watchLater = Watch_later::create([
            'id_user' => $idUser,
            'id_content' => $request->id_content,
            'date_added' => Carbon::now()->format('Y-m-d'),
        ]);

        return response([
            'message' => 'Video Added to Watch Later Successfully',
            'data' => $watchLater,
        ], 201);
    }


        /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $watch_later = watch_later::find($id);

        if($watch_later){
            return response([
                'message' => 'Watch Later Found',
                'data' => $watch_later
            ],200);
        }

        return response([
            'message' => 'Watch Later Not Found',
            'data' => null
        ],404);
    }

        /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $watch_later = watch_later::find($id);

        if(is_null($watch_later)){
            return response([
                'message' => 'Watch Later Not Found',
                'data' => null
            ],404);
        }

        if($watch_later->delete()){
            return response([
                'message' => 'Watch Later Deleted Successfully',
                'data' => $watch_later,
            ],200);
        }

        return response([
            'message' => 'Delete Watch Later Failed',
            'data' => null,
        ],400);
    }
}
