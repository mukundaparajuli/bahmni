import { useState } from 'react';

const useForm = (initialState) => {
    const [formData, setFormData] = useState(initialState);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleFileChange = (e, name) => {
        const file = e.target.files[0];
        setFormData((prev) => ({ ...prev, [name]: file }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    return { formData, handleChange, handleFileChange, errors, setErrors };
};

export default useForm;