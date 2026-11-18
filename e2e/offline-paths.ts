// Production builds for the offline specs, written by global-setup.ts. The server reads LIVE per
// request, so copying a build over it is a deploy.
const ROOT = 'node_modules/.cache/study-e2e';

export const OFFLINE_PORT = 4263;
export const LIVE = `${ROOT}/live`;
export const BUILD_A = `${ROOT}/a`;
export const BUILD_B = `${ROOT}/b`;
export const BUILD_KILLED = `${ROOT}/killed`;
