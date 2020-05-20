# WIP

Data validation with runtime type refinement.

Example:

```typescript
class User extends Class {
    id = UUID;
    username = String.check(x => x.length >= 2);
    email = String;
}

class Point2D extends Class {
    x = Number;
    y = Number;
}

const user = User.parse(await getUser())
const point = Point2D.parse(await getPoint())
```
