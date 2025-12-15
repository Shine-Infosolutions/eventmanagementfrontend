const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-2 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-md w-full my-4">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>
        <div className="p-3">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;