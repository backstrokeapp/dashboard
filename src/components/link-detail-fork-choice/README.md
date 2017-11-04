# LinkDetailForkChoice
Used to select the type of fork to sync to when selecting a fork in a link.

## Component Props
- `label: string` = The name of the choice, such as `All Forks` or `One Fork`.
- `icon: ReactComponent` - A tree of react elements to render as the icon in the choice.
- `active: boolean` - Render the choice as selected.
- `onClick: () => any` - Called when the user clicks on the choice.
