// SIGNUP PAGE

import SignupForm from "./components/signupForm";
import { Suspense } from "react";

export default function SignUp() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <SignupForm />
    </Suspense>
  );
}
