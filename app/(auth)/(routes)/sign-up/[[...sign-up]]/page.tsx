import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="sign-up-page w-screen h-screen flex items-center justify-center">
      <SignUp />
    </div>
  );
}
