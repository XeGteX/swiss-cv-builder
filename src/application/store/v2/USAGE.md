# CV Store v2 - Usage Examples

## Basic Field Updates

```typescript
import { useCVStoreV2 } from '@/application/store/v2';

function PersonalInfoEditor() {
  const updateField = useCVStoreV2(s => s.updateField);
  
  return (
    <>
      <input
        onChange={(e) => updateField('personal.firstName', e.target.value)}
      />
      <input
        onChange={(e) => updateField('personal.contact.email', e.target.value)}
      />
    </>
  );
}
```

## Using Optimized Selectors

```typescript
import { usePersonalInfo, useUpdateField } from '@/application/store/v2';

function PersonalSection() {
  // Only re-renders when personal info changes
  const personal = usePersonalInfo();
  const updateField = useUpdateField();
  
  return (
    <div>
      <h1>{personal.firstName} {personal.lastName}</h1>
      <input
        value={personal.title}
        onChange={(e) => updateField('personal.title', e.target.value)}
      />
    </div>
  );
}
```

## Array Operations

```typescript
import { useExperiences, useArrayActions } from '@/application/store/v2';

function ExperienceList() {
  const experiences = useExperiences();
  const { addExperience, removeExperience } = useArrayActions();
  
  return (
    <div>
      {experiences.map(exp => (
        <div key={exp.id}>
          <h3>{exp.role}</h3>
          <button onClick={() => removeExperience(exp.id)}>
            Remove
          </button>
        </div>
      ))}
      <button onClick={addExperience}>Add Experience</button>
    </div>
  );
}
```

## Nested Array Updates

```typescript
import { useCVStoreV2 } from '@/application/store/v2';

function TaskEditor({ experienceIndex }: { experienceIndex: number }) {
  const updateField = useCVStoreV2(s => s.updateField);
  
  const handleTaskUpdate = (taskIndex: number, value: string) => {
    updateField(`experiences.${experienceIndex}.tasks.${taskIndex}`, value);
  };
  
  return (
    <input
      onChange={(e) => handleTaskUpdate(0, e.target.value)}
    />
  );
}
```

## Batch Updates

```typescript
import { useCVStoreV2 } from '@/application/store/v2';

function QuickFill() {
  const batchUpdate = useCVStoreV2(s => s.batchUpdate);
  
  const fillDemoData = () => {
    batchUpdate({
      'personal.firstName': 'John',
      'personal.lastName': 'Doe',
      'personal.title': 'Senior Developer',
      'personal.contact.email': 'john@example.com',
      'summary': 'Experienced developer...'
    });
  };
  
  return <button onClick={fillDemoData}>Fill Demo Data</button>;
}
```

## Dynamic Path (for generic EditableField)

```typescript
import { useFieldValue, useUpdateField } from '@/application/store/v2';

function EditableField({ path }: { path: string }) {
  const value = useFieldValue<string>(path);
  const updateField = useUpdateField();
  
  return (
    <input
      value={value || ''}
      onChange={(e) => updateField(path, e.target.value)}
    />
  );
}

// Usage:
<EditableField path="personal.firstName" />
<EditableField path="experiences.0.role" />
```

## Computed Values

```typescript
import { useProfileCompletion, useFullName } from '@/application/store/v2';

function ProfileHeader() {
  const completion = useProfileCompletion();
  const fullName = useFullName();
  
  return (
    <div>
      <h1>{fullName}</h1>
      <progress value={completion} max={100} />
      <span>{completion}% Complete</span>
    </div>
  );
}
```

## Comparison: v1 vs v2

### v1 (OLD - with RegExp)
```typescript
// ❌ Fragile RegExp parsing
const arrayMatch = path.match(/(\w+)\[([^\]]+)\]/);
if (arrayMatch) {
  const [, arrayName, id] = arrayMatch;
  // Complex nested logic...
}

// ❌ Multiple slices, confusing API
updatePersonal({ firstName: 'John' });
updateExperience('id-123', { role: 'Dev' });
```

### v2 (NEW - with lodash)
```typescript
// ✅ Battle-tested lodash
import { set } from 'lodash';
set(cloned, path, value);

// ✅ Single, consistent API
updateField('personal.firstName', 'John');
updateField('experiences.0.role', 'Dev');
```

## Migration from v1

```typescript
// v1
const { updatePersonal } = useCVStore();
updatePersonal({ firstName: 'John' });

// v2
const updateField = useUpdateField();
updateField('personal.firstName', 'John');
```
