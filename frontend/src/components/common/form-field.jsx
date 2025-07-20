import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const FormField = ({ label, id, type = 'text', name, value, onChange, required, accept, placeholder }) => (
    <div className="mb-4 flex-col space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <Input
            id={id}
            type={type}
            name={name}
            value={type !== 'file' ? value : undefined}
            onChange={onChange}
            required={required}
            accept={accept}
            placeholder={placeholder}
        />
    </div>
);

export default FormField;