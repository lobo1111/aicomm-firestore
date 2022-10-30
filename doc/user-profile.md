# User Profile

User profile represents a collection of documents that describe user data. Each user data record is connected to the authentication record.

User profile is visible to the profile owner and anyone with the HR claim. Structure of the profile is as follows:

```
userProfile/{uid}
    /common
    /restricted
```

## ‘Common’ section

Represents common user profile settings that are editable by the owner of the profile and anyone with the HR claim

Data example

```
{
	"first-name": <string>,
	"last-name": <string>,
	"e-mail": <string>
}
```

## ‘Restricted’ section

Represents user profile settings that are available to read for profile owner but only users with HR claim may edit those.

Data example

```
{
	"department": <string>,
	"manager": <string>
}
```

## Strategy for custom attributes

There are no restrictions regarding custom attributes in any of the listed sections.
