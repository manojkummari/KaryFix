const Button = ({
  children,
  type = 'button',
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles =
    'px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-yellow-500 text-black hover:bg-yellow-400 focus:ring-yellow-500 font-semibold shadow-lg shadow-yellow-500/30',
    secondary:
      'bg-neutral-800/60 backdrop-blur-md text-yellow-500 hover:bg-neutral-700/60 focus:ring-yellow-500 border border-neutral-700/50',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-lg shadow-red-500/30',
    success:
      'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-lg shadow-green-500/30',
    outline:
      'border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black focus:ring-yellow-500 backdrop-blur-sm',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
