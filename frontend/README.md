# Laravel Breeze - Typescript Next.js Next Auth Edition 🏝️

### Note

Breeze, Replaced default Auth with Next-Auth, Updated to Latest Next.js, TailwindCSS, DaisyUI and Formik. Removed unnecessary packages and converted into Typescript. May require adding tsignore if using strict mode.

## Introduction

This repository is an implementing of the [Laravel Breeze](https://laravel.com/docs/starter-kits) application / authentication starter kit frontend in [Next.js](https://nextjs.org). All of the authentication boilerplate is already written for you - powered by [Laravel Sanctum](https://laravel.com/docs/sanctum), allowing you to quickly begin pairing your beautiful Next.js frontend with a powerful Laravel backend.

This branch is for the API Tokens based method, which doesn't require the same root domain

## Official Documentation

### Installation

First, create a Next.js compatible Laravel backend by installing Laravel Breeze into a [fresh Laravel application](https://laravel.com/docs/installation) and installing Breeze's API scaffolding:

```bash
# Create the Laravel application...
laravel new next-backend

cd next-backend

# Install Breeze and dependencies...
composer require laravel/breeze --dev

php artisan breeze:install api
```

### Default PHP Laravel Changes Required

Some changes to the Personal Access tokens are required

```
Under migration create_personal_access_tokens

in up(), add/change the below for uuids
$table->uuid('id')->primary()->default(Str::uuid());
$table->uuidMorphs('tokenable');
```

Create app/Models/Sanctum folder and add below file as PersonalAccessToken.php

```
<?php

namespace App\Models\Sanctum;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

class PersonalAccessToken extends SanctumPersonalAccessToken
{
    use HasUuids;

    protected $primaryKey = "id";
    protected $keyType = "string";
}

```

Finally, need to boot it in Providers/AppServiceProvider
```
    public function boot()
    {
        Sanctum::usePersonalAccessTokenModel(PersonalAccessToken::class);
    }
```

Then, add the API Route to create the token, under routes/api.php
```
// Create token for authed user
Route::middleware(['auth:sanctum'])->post('/tokens/create', function (Request $request) {
    $user = $request->user();

    // Delete all existing tokens
    $user->tokens()->delete();

    $token = $user->createToken('API Access Token');
    return ['token' => $token->plainTextToken];
});
```

### CSRF Protection doesn't work for API token auth
Remember add all api/post routes to exception from CSRF Protection, App\Http\Middleware\VerifyCsrfToken. Otherwise will keep getting a CSRF token mismatch error. 

### Use API Resources in Laravel
The **user** assumes it's returned as a User Resource from Laravel, which is why is uses the res.data.data format (api resource returns as data. Then axios wraps response in data). Make sure
to use Api Resources so it returns that. Most times, the api assumes it's using default pagnation so requests can pass page numbers etc.


Next, ensure that your application's `APP_URL` and `FRONTEND_URL` environment variables are set to `http://localhost:8000` and `http://localhost:3000`, respectively.

```
# PHP Laravel Env File

APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# MOST IMPORTANT, MUST SET TO SAME ROOT DOMAIN
SESSION_DOMAIN=localhost

# Add Front/Backend domains here
SANCTUM_STATEFUL_DOMAINS=localhost:8000,localhost:3000

```


```bash
# Serve the application
php artisan serve
```

Next, clone this repository and install its dependencies with `yarn install` or `npm install`. Then, copy the `.env.example` file to `.env.local` and supply the URL of your backend:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

Finally, run the application via `npm run dev`. The application will be available at `http://localhost:3000`:

```
npm run dev
```

> Note: Currently, we recommend using `localhost` during local development of your backend and frontend to avoid CORS "Same-Origin" issues.

### Authentication Hook

Uses Next-Auth useSession() for cookie based authentication. CSRF and Auth cookies are set in the serverside and automatically set into axios on cilentside after login. 
```js
const ExamplePage = () => {
    const { data: session, status} = useSession()

    return (
        <>
            <p>{session?.user}</p>

            <button onClick={logout}>Sign out</button>
        </>
    )
}

export default ExamplePage
```

> Note: You will need to use [optional chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) (`user?.name` instead of `user.name`) when accessing properties on the user object to account for Next.js's initial server-side render.

### Middleware Redirect if Auth

Add the below hook to redirect the page if user is authenticated. Uses next-auth to get status and useEffect to update when values change.

```
// Redirect to dashboard if authed
const {} = useAuthMiddleware('/dashboard')
```

### Named Routes

For convenience, [Ziggy](https://github.com/tighten/ziggy#spas-or-separate-repos) may be used to reference your Laravel application's named route URLs from your React application.

## Contributing

Thank you for considering contributing to Breeze Next! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

Please review [our security policy](https://github.com/laravel/breeze-next/security/policy) on how to report security vulnerabilities.

## License

Laravel Breeze Next is open-sourced software licensed under the [MIT license](LICENSE.md).
