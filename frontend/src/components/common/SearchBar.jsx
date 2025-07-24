import React, { useState } from 'react';
import FormField from '@/components/common/form-field';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form
            onSubmit={handleSearch}
            className="flex w-full max-w-4xl p-4 bg-white items-center gap-3 mb-4"
        >
            <FormField
                label="Search Documents"
                id="search"
                name="search"
                value={query}
                onChange={handleInputChange}
                placeholder="Enter document name or MRN..."
                className="w-full"
                required
            />
            <Button
                type="submit"
                aria-label="Search"
                className="inline-flex items-center justify-center px-4 py-2 text-white rounded-lg transition"
            >
                <Search className="w-5 h-5" />
            </Button>
        </form>
    );
};

export default SearchBar;