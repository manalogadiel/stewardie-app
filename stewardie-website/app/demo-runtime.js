/* Website-demo fixes for the checked-in Flutter build. See ../DEMO-FIXES.md. */
(function () {
  'use strict';
  window.stewardieDemo = {
    install(A, B, $, t) {
      const photoKey = 'stewardie.demo.avatar.v1';
      let photo = null;
      let demoRepository;
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
        demoRepository = state.a.d;
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

      // Private map locations have no authenticated UID in this demo.
      const privatePin = A.W1.prototype.a9c;
      A.W1.prototype.a9c = function (uid, name, point) {
        const localMember = A.biz().length === 0 && uid == null;
        return privatePin.call(this, localMember ? 'me' : uid,
          localMember ? demoRepository?.z || name : name, point);
      };

      // Desktop browsers treat <input capture> as a file picker. Use a real
      // webcam for camera selections; gallery selections keep the file picker.
      const pickImage = A.LN.prototype.ajK;
      A.LN.prototype.ajK = function (quality, width, height, metadata, source) {
        if (source !== B.wF) return pickImage.call(this, quality, width, height, metadata, source);
        return A.dY(window.stewardieDemo.capturePhoto().then(blob => {
          if (blob == null) return null;
          const url = URL.createObjectURL(blob);
          const file = A.RD(url, null, blob.size, blob.type, 'camera.jpg');
          const read = file.Gd;
          file.Gd = function () {
            return read.call(this).bk({
              $1(bytes) { URL.revokeObjectURL(url); return bytes; }, $S: 47
            }, t.e).eJ({
              $1(error) { URL.revokeObjectURL(url); throw error; }, $S: 47
            });
          };
          return file;
        }), t.Vv);
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
    },
    capturePhoto() {
      return new Promise(resolve => {
        const previousFocus = document.activeElement;
        const dialog = document.createElement('dialog');
        dialog.setAttribute('aria-label', 'Take a profile photo');
        dialog.style.cssText = 'box-sizing:border-box;width:min(92vw,480px);max-height:90vh;padding:20px;border:0;border-radius:24px;background:#faf9f6;color:#202633;font:16px system-ui;box-shadow:0 16px 60px #0005;overflow:auto';
        dialog.innerHTML = '<h2 style="margin:0 0 12px">Take a photo</h2>' +
          '<video autoplay muted playsinline style="width:100%;max-height:55vh;object-fit:contain;border-radius:16px;background:#202633;transform:scaleX(-1)"></video>' +
          '<p role="status" aria-live="polite">Starting your camera…</p>' +
          '<div style="display:flex;gap:12px;justify-content:flex-end"><button type="button" data-cancel>Cancel</button><button type="button" data-capture disabled>Take photo</button></div>';
        for (const button of dialog.querySelectorAll('button')) {
          button.style.cssText = 'min-height:44px;padding:10px 18px;border:0;border-radius:12px;font:inherit;font-weight:600;cursor:pointer';
        }
        const capture = dialog.querySelector('[data-capture]');
        capture.style.background = '#244bff'; capture.style.color = 'white';
        const cancel = dialog.querySelector('[data-cancel]');
        const video = dialog.querySelector('video');
        const status = dialog.querySelector('[role="status"]');
        let stream, finished = false;
        function finish(blob) {
          if (finished) return;
          finished = true;
          stream?.getTracks().forEach(track => track.stop());
          video.srcObject = null;
          document.removeEventListener('visibilitychange', hidden);
          dialog.close(); dialog.remove();
          previousFocus?.focus();
          resolve(blob);
        }
        function hidden() { if (document.hidden) finish(null); }
        document.addEventListener('visibilitychange', hidden);
        dialog.addEventListener('cancel', event => { event.preventDefault(); finish(null); });
        cancel.onclick = () => finish(null);
        capture.onclick = () => {
          if (!video.videoWidth || !video.videoHeight) return;
          capture.disabled = true;
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth; canvas.height = video.videoHeight;
          canvas.getContext('2d').drawImage(video, 0, 0);
          canvas.toBlob(blob => {
            if (blob) finish(blob);
            else { status.textContent = 'Could not capture that photo. Try again.'; capture.disabled = false; }
          }, 'image/jpeg', .9);
        };
        document.body.append(dialog);
        dialog.showModal(); cancel.focus();
        (async () => {
          try {
            if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
              throw new Error('Open this demo over HTTPS or localhost to use the camera.');
            }
            stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: { ideal: 'user' }, width: { ideal: 1280 } }, audio: false
            });
            if (finished) { stream.getTracks().forEach(track => track.stop()); return; }
            video.srcObject = stream;
            await video.play();
            if (finished) return;
            status.textContent = 'Your camera is ready.';
            capture.disabled = false;
          } catch (error) {
            if (finished) return;
            stream?.getTracks().forEach(track => track.stop());
            status.textContent = error.name === 'NotAllowedError'
              ? 'Allow camera access in your browser’s site permissions, then reopen Take photo. You can also choose a photo from your files.'
              : error.name === 'NotReadableError'
              ? 'Your camera is busy. Close other camera apps and try again, or choose a photo from your files.'
              : error.name === 'NotFoundError'
              ? 'No camera is connected. You can choose a photo from your files.'
              : error.message || 'Could not start the camera. You can choose a photo from your files.';
          }
        })();
      });
    }
  };
})();
