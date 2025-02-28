import { PerspectiveCamera, Vector3 } from "three";

export const updateDirection32 = ( target: Vector3, camera: PerspectiveCamera ) => {
    let dir;
    const adj = target.z - camera.position.z;
    const opp = target.x - camera.position.x;
    const a = Math.atan2( opp, adj ) / Math.PI;
    if ( a < 0 ) {
        dir = Math.floor( ( a + 2 ) * 16 );
    } else {
        dir = Math.floor( a * 16 );
    }
    if ( dir != camera.userData.direction ) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        camera.userData.prevDirection = camera.userData.direction;
        camera.userData.direction = dir;
    }
};
