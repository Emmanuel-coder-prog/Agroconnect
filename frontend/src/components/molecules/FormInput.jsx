import React from "react";
import Input from "../atoms/input/Input";

function FormInput({ label, type, value, onChange, required, placeholder }) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Input 
        type={type} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

export default FormInput;
