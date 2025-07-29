import { useState, useEffect } from 'react';
import { getEducations, getProfessions, getDepartments } from '@/api/options';

export const useOptions = () => {
    const [options, setOptions] = useState({
        educations: [],
        professions: [],
        departments: []
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                setLoading(true);
                setError(null);

                const [educations, professions, departments] = await Promise.all([
                    getEducations(),
                    getProfessions(),
                    getDepartments()
                ]);

                setOptions({
                    educations: educations.map(item => ({
                        id: item.id,
                        value: item.id.toString(),
                        label: item.name
                    })),
                    professions: professions.map(item => ({
                        id: item.id,
                        value: item.id.toString(),
                        label: item.name
                    })),
                    departments: departments.map(item => ({
                        id: item.id,
                        value: item.id.toString(),
                        label: item.name
                    }))
                });
            } catch (err) {
                console.error('Error fetching options:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOptions();
    }, []);

    const refreshOptions = async () => {
        const fetchOptions = async () => {
            try {
                setError(null);
                const [educations, professions, departments] = await Promise.all([
                    getEducations(),
                    getProfessions(),
                    getDepartments()
                ]);

                setOptions({
                    educations: educations.map(item => ({
                        id: item.id,
                        value: item.id.toString(),
                        label: item.name
                    })),
                    professions: professions.map(item => ({
                        id: item.id,
                        value: item.id.toString(),
                        label: item.name
                    })),
                    departments: departments.map(item => ({
                        id: item.id,
                        value: item.id.toString(),
                        label: item.name
                    }))
                });
            } catch (err) {
                console.error('Error refreshing options:', err);
                setError(err);
            }
        };

        await fetchOptions();
    };

    return {
        options,
        loading,
        error,
        refreshOptions
    };
};