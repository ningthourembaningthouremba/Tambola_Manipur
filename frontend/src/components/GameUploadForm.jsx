// components/PopupForm.jsx
import React, { useState } from 'react';

const GameUploadForm = ({ visible, onClose, onSubmit, fields = [], isLoading}) => {
  const [formData, setFormData] = useState({});

  // fromating the submitting form
  const handleChange = (e, name) => {
    setFormData({
      ...formData,
      [name]: e.target.value
    });
  };

  // submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose(); // optional: close after submit
  };


  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-slate-700 p-6 rounded shadow-lg w-[calc(100%-30px)] max-w-95 relative">
        <button
          className="absolute top-2 right-4 text-gray-100"
          onClick={onClose}
        >
          Cancel
        </button>
        <h2 className="text-lg font-bold mb-4">Upload New Game</h2>

        <form className='flex flex-col gap-3'
          onSubmit={handleSubmit}
        >
          {fields.map((field, index) => (
            <div key={index} className='grid grid-cols-3'>
              <label htmlFor={field.name}>{field.label}</label>
              <input className='bg-slate-800 p-2 col-span-2'
                name={field.name}
                type={field.type}
                id={field.name}
                value={field.value}
                onChange={(e) => handleChange(e, field.name)}
              />
            </div>
          ))}
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
          >
            {!isLoading ? "Submit" : "Uploading..."}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GameUploadForm;
