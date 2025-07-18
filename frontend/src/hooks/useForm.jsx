import { useState } from 'react';

const useForm = (initialValues) => {
    const [formData, setFormData] = useState(initialValues);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, field) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.files[0] }));
    };

    return { formData, setFormData, handleChange, handleFileChange };
};

export default useForm;