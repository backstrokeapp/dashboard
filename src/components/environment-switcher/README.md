# EnvironmentSwitcher

A modal that is triggered by a secret keyboard shortcut used to switch the environment from
to production, staging, or something arbitrary.

## Component Props
- `keys: [string]` - A sequence of keys to press to open the environment switcher. Defaults to `['!', '!', '`']`.
- `fields` - Fields to make changable in the environment switcher.

Follows this shape:
```json
[
  {
    name: 'My server',
    slug: 'server',
    defaults: {
      'Production': 'https://api.backstroke.us',
      'Staging': 'https://api.staging.backstroke.us',
    }
  }
]
```
