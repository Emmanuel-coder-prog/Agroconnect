import { Link } from "react-router-dom";

function AuthTemplate({ title, children, isLogin }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-12">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {title}
          </h1>
          <p className="text-gray-500 text-sm">
            {isLogin ? "Welcome back! Please login to continue." : "Join AgroConnect today and manage your farm services efficiently."}
          </p>
        </div>
        {children}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? (
              <>
                Already have an account?{" "}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                  Login
                </Link>
              </>
            ) : (
              <>
                {/* Don't have an account?{" "}
                <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                  Signup
                </Link> */}
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthTemplate;
