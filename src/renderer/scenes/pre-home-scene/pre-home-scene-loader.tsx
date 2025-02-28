import sceneStore from "@stores/scene-store";
import { settingsStore } from "@stores/settings-store";
import { initializeAssets } from "@image/assets";
import { log } from "@ipc/log";
import { preloadIntro } from "../home/space-scene";
import { root } from "@render/root";
import { PreHomeScene } from "./pre-home-scene";
import {  waitForTruthy } from "@utils/wait-for";
import path from "path";
import { Filter } from "@audio/filter";
import { SceneState } from "../scene";
import { mixer } from "@core/global";
import processStore from "@stores/process-store";

let _lastErrorMessage = "";

const makeErrorScene = ( errors: string[] ) => {
    if ( errors.length ) {
        const message = errors.join( ", " );
        if ( message !== _lastErrorMessage ) {
            log.error( message );
            sceneStore().setError( new Error( message ) );
            _lastErrorMessage = message;
        }
    } else {
        sceneStore().clearError();
    }
};

export async function preHomeSceneLoader(): Promise<SceneState> {
    processStore().create( "pre-home-scene", 7 );
    root.render( <PreHomeScene /> );

    log.debug( "Loading settings" );
    const settings = await settingsStore().load();

    await waitForTruthy( () => {
        makeErrorScene( settingsStore().errors );
        return settingsStore().errors.length === 0;
    } );

    await initializeAssets( settings.data.directories );

    await preloadIntro();

    log.debug( "Loading intro" );

    mixer.setVolumes( settings.data.audio );

    const dropYourSocks = mixer.context.createBufferSource();
    dropYourSocks.buffer = await mixer.loadAudioBuffer(
        path.join( __static, "drop-your-socks.mp3" )
    );

    const _disconnect = mixer.connect(
        dropYourSocks,
        new Filter( mixer, "bandpass", 50 ).node,
        mixer.intro
    );

    dropYourSocks.onended = () => _disconnect();

    return {
        id: "@loading",
        start: () => {
            dropYourSocks.detune.setValueAtTime( -200, mixer.context.currentTime + 5 );
            dropYourSocks.start();
        },
        dispose: () => {},
    };
}
