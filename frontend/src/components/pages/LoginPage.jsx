import AuthTemplate from "../templates/Tem";
import LoginForm from "../organisms/form/LoginForm";

function Login() {

  return (
    <AuthTemplate title="Welcome Back">
      <LoginForm />
    </AuthTemplate>
  );
}

export default Login;
