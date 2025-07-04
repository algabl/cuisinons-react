import { SignIn } from "@clerk/nextjs";

export default async function LoginPage(props: {
  searchParams?: Promise<{ callbackUrl?: string }>;
}) {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      {/* <div className="w-full max-w-sm md:max-w-3xl"> */}
      <SignIn />
      {/* <LoginForm
          callbackUrl={(await props.searchParams)?.callbackUrl ?? "/app"}
        /> */}
      {/* </div> */}
    </div>
  );
}
