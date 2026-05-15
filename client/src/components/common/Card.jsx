const Card = ({ children, title, className = '', ...props }) => {
  return (
    <div
      className={`bg-neutral-800/60 backdrop-blur-xl rounded-lg shadow-xl shadow-black/30 border border-neutral-700/50 overflow-hidden ${className}`}
      {...props}
    >
      {title && (
        <div className="px-6 py-4 border-b border-neutral-700/50 bg-neutral-900/40 backdrop-blur-md">
          <h3 className="text-lg font-semibold text-yellow-500">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;
