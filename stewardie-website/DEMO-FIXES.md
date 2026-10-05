# Website demo fixes

These changes apply only to the compiled demo in `app/`. The neighboring
`stewardie` Flutter source repository was not modified or rebuilt.

`app/index.html` loads `demo-runtime.js` before Flutter. A single hook at the
end of `main.dart.js` installs the demo overrides before the app starts.
The bootstrap service-worker version was bumped for returning visitors.

## Camera

Camera discovery requests one video-only permission stream, enumerates devices,
and releases every permission-stream track. It no longer attempts to open every
listed camera, which previously meant one disconnected or unavailable virtual
camera could prevent a working camera from starting. The selected camera still
uses Flutter's normal preview, capture, switching, and disposal paths.

Browser permission prompts can temporarily unfocus the iframe. Camera startup
now continues across that inactive state; hiding or pausing the app still
releases the camera. Permission failures explain browser site permissions;
insecure origins explain the HTTPS/localhost requirement.

## Profile photo

The confirmed onboarding photo now updates the demo member `me`, including
mounted and newly created avatars, without requiring a Firebase account.
It is stored locally under `stewardie.demo.avatar.v1` and restored after reload.
Existing photos in the old onboarding draft are recovered on startup. Removing
the photo or resetting the demo clears the saved avatar. If browser storage is
blocked, the current session still updates its avatars.

## Verification

Chrome browser checks passed for photo selection/crop confirmation, rendering
in the main app, reload persistence, old-draft recovery, and demo reset. Camera
checks used Chrome's simulated webcam plus a disconnected device entry:
discovery opened one stream and released it, and the working camera initialized
and captured a nonempty JPEG. Physical camera hardware was not tested.

## Future builds

This adapter targets the checked-in Dart-to-JavaScript build and its generated
symbols. Replacing `main.dart.js` with a new Flutter build requires adapting
these hooks to that build or implementing equivalent fixes in the demo's source.
Do not copy this adapter into the production mobile app.
