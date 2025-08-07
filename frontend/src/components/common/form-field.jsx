import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const FormField = ({ label, id, type = 'text', name, value, onChange, required, accept, placeholder, options, disabled }) => (
    <div className="mb-4 flex-col space-y-2">
        <Label htmlFor={id}>{label}</Label>
        {options ? (
            <Select name={name} value={value} onValueChange={(val) => onChange({ target: { name, value: val } })} required={required} disabled={disabled}>
                <SelectTrigger id={id}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        ) : (
            <Input
                id={id}
                type={type}
                name={name}
                value={type !== 'file' ? value : undefined}
                onChange={onChange}
                required={required}
                accept={accept}
                placeholder={placeholder}
                disabled={disabled}
            />
        )}
    </div>
);

export default FormField;