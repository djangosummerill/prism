<p align="center">
  <img src="/../assets/icons/prism_accent.png"  alt="Prism" width="500"><br>
  The universal chat app.
</p>

## Description

[Prism](https://prism.djangosummerill.com/) is a universal chat app made for the [T3 Cloneathon](https://cloneathon.t3.chat/) in the span of just over a week. By universal, it means you can chat to multiple different LLMs across multiple different providers.

## Local Setup

1. Setup accounts on [Supabase](https://supabase.com/), [OpenRouter](https://openrouter.com/) & [UploadThing](https://uploadthing.com/) (be aware you will have to have credits in OpenRouter to use the LLMs!)
2. Paste their respective API keys in `.env.local`, following the format provided in `.env.local.example`
3. Run `schema.sql` in Supabase, to create the nessecary database
4. (optional) [Setup Google authentication in Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google/]
4. Run `pnpm install`, then `pnpm build` and `pnpm start`
5. Enjoy!

## License

This project is licensed under the MIT license - see the LICENSE file for more info.
