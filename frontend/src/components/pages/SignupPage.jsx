import AuthTemplate from "../templates/Tem";
import SignupForm from "../organisms/form/SignupForm";


function Signup() {
  return (
    <AuthTemplate title="Create an Account" >
      <SignupForm />
    </AuthTemplate>
  );
}

export default Signup;

