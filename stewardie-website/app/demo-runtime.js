/* Website-demo fixes for the checked-in Flutter build. See ../DEMO-FIXES.md. */
(function () {
  'use strict';
  window.stewardieDemo = {
    install(A, B, $, t) {
      const photoKey = 'stewardie.demo.avatar.v1';
      let photo = null;
      try { photo = A.bjU(localStorage.getItem(photoKey)); } catch (_) {}

      // The demo has no Firebase account. Its current member ID is "me".
      const bindAvatar = A.TZ.prototype.aIz;
      A.TZ.prototype.aIz = function () {
        bindAvatar.call(this);
        if (A.biz().length === 0 && this.a.c === 'me') this.e = photo;
      };
      function setPhoto(value) {
        photo = A.bjU(value);
        try {
          if (photo === null) localStorage.removeItem(photoKey);
          else localStorage.setItem(photoKey, value);
        } catch (_) { /* In-memory updates still work when storage is blocked. */ }
        A.bMr('me', photo);
      }
      const choosePhoto = A.b24.prototype.$1;
      A.b24.prototype.$1 = function (value) {
        choosePhoto.call(this, value);
        setPhoto(value);
      };
      // Recover a photo already chosen in an older demo session's draft.
      const loadDemo = A.SK.prototype.vv;
      A.SK.prototype.vv = function () {
        const state = this;
        return loadDemo.call(this).bk({
          $1() {
            if (photo !== null) return null;
            const store = $.Bp().v0('onboarding_v1');
            const type = store.$ti;
            return A.kx(A.dB(store, 'draft_pre_auth', type.c, type.y[1]),
              state.a.e, t.N, t.J).bk({
                $1(draft) {
                  const value = draft == null ? null : A.aF(draft.i(0, 'avatarBase64'));
                  if (value != null) setPhoto(value);
                }, $S: 47
              }, t.H);
          }, $S: 47
        }, t.H).eJ({ $1() { /* Draft recovery is best effort. */ }, $S: 47 });
      };
      const resetDemo = A.aX8.prototype.$0;
      A.aX8.prototype.$0 = function () {
        setPhoto(null);
        return resetDemo.call(this);
      };

      // camera_web probes every enumerated device. One disconnected/virtual
      // camera can therefore prevent a working camera from appearing at all.
      // Ask for permission once, release that stream, then use device metadata.
      A.ao8.prototype.oO = function () {
        const plugin = this;
        return A.dY((async function () {
          const media = navigator.mediaDevices;
          if (!window.isSecureContext || !media?.getUserMedia) {
            throw A.d(A.k2('CameraAccessDenied',
              'Camera access requires HTTPS or localhost.'));
          }
          let stream;
          try {
            stream = await media.getUserMedia({ video: true, audio: false });
            const cameras = A.b([], t.Hw);
            const devices = await media.enumerateDevices();
            for (const device of devices) {
              if (device.kind !== 'videoinput') continue;
              const rear = /back|rear|environment/i.test(device.label);
              const description = new A.oc(
                device.label || 'Camera', rear ? B.kt : B.nN, 0);
              plugin.d.m(0, description, new A.Js(device.deviceId, null));
              cameras.push(description);
            }
            return cameras;
          } catch (error) {
            if (error?.name === 'NotAllowedError' || error?.name === 'SecurityError') {
              throw A.d(A.k2('CameraAccessDenied', error.message));
            }
            throw error;
          } finally {
            stream?.getTracks().forEach(track => track.stop());
          }
        })(), t.RI);
      };

      // Browser permission prompts temporarily unfocus the iframe. Keep the
      // pending camera initialization alive; hidden/paused still releases it.
      const cameraLifecycle = A.S5.prototype.l_;
      A.S5.prototype.l_ = function (state) {
        if (state === B.eW) return;
        return cameraLifecycle.call(this, state);
      };
      const cameraError = A.aV6.prototype.$0;
      A.aV6.prototype.$0 = function () {
        cameraError.call(this);
        if (!window.isSecureContext) {
          this.a.Q = 'Open this demo over HTTPS or localhost to use the camera, or choose a photo.';
        } else if (this.a.as) {
          this.a.Q = 'Allow camera access in your browser’s site permissions, then try again, or choose a photo.';
        }
      };
    }
  };
})();
