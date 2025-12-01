# Atomic Editor - Usage Examples

## Basic Usage

```typescript
import { EditableField } from '@/components/atomic-editor';

function PersonalHeader() {
  return (
    <EditableField
      path="personal.firstName"
      label="First Name"
      validation={{ required: true, minLength: 2 }}
    >
      {(value) => (
        <h1 className="text-5xl font-bold uppercase">
          {value}
        </h1>
      )}
    </EditableField>
  );
}
```

## Full Personal Info Section

```typescript
import { EditableField, EditableEmail, EditablePhone } from '@/components/atomic-editor';

function PersonalInfoSection() {
  return (
    <div className="space-y-4">
      {/* Name */}
      <EditableField path="personal.firstName" label="First Name" validation={{ required: true }}>
        {(firstName) => (
          <EditableField path="personal.lastName" label="Last Name" validation={{ required: true }}>
            {(lastName) => (
              <h1 className="text-5xl font-bold uppercase">
                {firstName} {lastName}
              </h1>
            )}
          </EditableField>
        )}
      </EditableField>

      {/* Title */}
      <EditableField path="personal.title" label="Professional Title" validation={{ required: true }}>
        {(title) => (
          <h2 className="text-2xl text-gray-700">{title}</h2>
        )}
      </EditableField>

      {/* Contact - Using preset components */}
      <div className="flex gap-4">
        <EditableEmail path="personal.contact.email" label="Email">
          {(email) => (
            <span className="text-sm">{email}</span>
          )}
        </EditableEmail>

        <EditablePhone path="personal.contact.phone" label="Phone">
          {(phone) => (
            <span className="text-sm">{phone}</span>
          )}
        </EditablePhone>
      </div>
    </div>
  );
}
```

## Multiline Text (Summary)

```typescript
import { EditableField } from '@/components/atomic-editor';

function SummarySection() {
  return (
    <EditableField
      path="summary"
      label="Professional Summary"
      placeholder="Write a brief summary of your experience..."
      multiline
      validation={{ minLength: 50, maxLength: 500 }}
    >
      {(summary) => (
        <p className="text-gray-700 leading-relaxed">
          {summary}
        </p>
      )}
    </EditableField>
  );
}
```

## Array Items (Experiences)

```typescript
import { EditableField } from '@/components/atomic-editor';
import { useExperiences } from '@/store/v2';

function ExperienceList() {
  const experiences = useExperiences();

  return (
    <div className="space-y-6">
      {experiences.map((exp, index) => (
        <div key={exp.id} className="border-l-4 border-purple-500 pl-4">
          {/* Role */}
          <EditableField
            path={`experiences.${index}.role`}
            label="Role"
            validation={{ required: true }}
          >
            {(role) => (
              <h4 className="text-xl font-bold">{role}</h4>
            )}
          </EditableField>

          {/* Company */}
          <EditableField
            path={`experiences.${index}.company`}
            label="Company"
            validation={{ required: true }}
          >
            {(company) => (
              <h5 className="text-lg text-gray-600">{company}</h5>
            )}
          </EditableField>

          {/* Tasks (nested array) */}
          {exp.tasks.map((task, taskIndex) => (
            <EditableField
              key={taskIndex}
              path={`experiences.${index}.tasks.${taskIndex}`}
              label={`Task ${taskIndex + 1}`}
            >
              {(taskValue) => (
                <li className="text-sm text-gray-700">{taskValue}</li>
              )}
            </EditableField>
          ))}
        </div>
      ))}
    </div>
  );
}
```

## With Transformation

```typescript
import { EditableField } from '@/components/atomic-editor';

function UppercaseTitle() {
  return (
    <EditableField
      path="personal.title"
      label="Title"
      transform={(value) => value.toUpperCase()}
    >
      {(title) => (
        <h2 className="text-3xl font-bold">{title}</h2>
      )}
    </EditableField>
  );
}
```

## Custom Validation

```typescript
import { EditableField } from '@/components/atomic-editor';

function YearField() {
  return (
    <EditableField
      path="educations.0.year"
      label="Graduation Year"
      validation={{
        required: true,
        custom: (value) => {
          const year = parseInt(value);
          if (isNaN(year)) return 'Must be a valid year';
          if (year < 1950 || year > 2030) return 'Year must be between 1950 and 2030';
          return true;
        }
      }}
    >
      {(year) => <span>{year}</span>}
    </EditableField>
  );
}
```

## Preset Variants

```typescript
import { EditableText, EditableTextarea, EditableEmail, EditablePhone } from '@/components/atomic-editor';

function QuickDemo() {
  return (
    <>
      {/* Single line text */}
      <EditableText path="personal.firstName" label="First Name">
        {(value) => <span>{value}</span>}
      </EditableText>

      {/* Multiline */}
      <EditableTextarea path="summary" label="Summary">
        {(value) => <p>{value}</p>}
      </EditableTextarea>

      {/* Email (auto-validated) */}
      <EditableEmail path="personal.contact.email" label="Email">
        {(value) => <a href={`mailto:${value}`}>{value}</a>}
      </EditableEmail>

      {/* Phone (auto-validated) */}
      <EditablePhone path="personal.contact.phone" label="Phone">
        {(value) => <a href={`tel:${value}`}>{value}</a>}
      </EditablePhone>
    </>
  );
}
```

## Disabled State

```typescript
import { EditableField } from '@/components/atomic-editor';

function DisabledExample() {
  const [isPdfMode, setIsPdfMode] = useState(false);

  return (
    <EditableField
      path="personal.firstName"
      label="First Name"
      disabled={isPdfMode}
    >
      {(value) => <h1>{value}</h1>}
    </EditableField>
  );
}
```

## Key Differences from v1

### v1 (OLD - data-* attributes)
```tsx
// ❌ Fragile, tightly coupled
<div
  data-inline-edit="personal.firstName"
  data-inline-label="First Name"
  data-inline-required="true"
>
  {personal.firstName}
</div>
```

### v2 (NEW - Component wrapper)
```tsx
// ✅ Self-contained, type-safe, reusable
<EditableField
  path="personal.firstName"
  label="First Name"
  validation={{ required: true }}
>
  {(firstName) => <h1>{firstName}</h1>}
</EditableField>
```

## Benefits

- ✅ **No DOM attributes** - Clean HTML
- ✅ **Type-safe paths** - Autocomplete works
- ✅ **Self-contained** - All logic in component
- ✅ **Reusable** - Use anywhere
- ✅ **Validation** - Built-in rules
- ✅ **Testable** - Easy to unit test
- ✅ **Flexible** - Render props pattern
