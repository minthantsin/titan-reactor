uniform sampler2D fogBitmap;
uniform sampler2D unitsBitmap;
uniform sampler2D resourcesBitmap;
uniform sampler2D creepBitmap;
uniform sampler2D terrainBitmap;

uniform float fogOfWarOpacity;
uniform float uOpacity;
uniform float uSoftEdges;

varying vec2 vUv;
varying vec2 mapUv;
varying vec2 mapAspect;
varying vec2 bounds;

void main() {
    vec4 minimapTerrainColor = texture2D(terrainBitmap, mapUv);
    vec4 creepColor = texture2D(creepBitmap, mapUv);
    vec4 unitsColor = texture2D(unitsBitmap, mapUv);
    vec4 fogColor = texture2D(fogBitmap, mapUv);
    vec4 resourcesColor = texture2D(resourcesBitmap, mapUv);

    vec4 result = vec4(minimapTerrainColor.rgb, uOpacity * uOpacity);

    result = mix(result, creepColor, creepColor.a * uOpacity * uOpacity);

    // intensify unit color on lower opacity
    unitsColor = vec4(unitsColor.rgb + vec3(1.0 - uOpacity) * 0.25, unitsColor.a);

    result = mix(result, unitsColor, unitsColor.a * uOpacity);
    result = mix(result, fogColor, fogColor.a * fogOfWarOpacity * uOpacity * 1.2);
    result = mix(result, resourcesColor, resourcesColor.a * uOpacity * uOpacity);

    result = mix(
        vec4(0.0, 0.0, 0.0, result.a),
        result,
        step(bounds.x, vUv.x) *
            step(bounds.y, vUv.y) *
            step(bounds.x, 1.0 - vUv.x) *
            step(bounds.y, 1.0 - vUv.y)
    );
    // TODO; multiply 0.1 (edge distance) by aspect ratio
    // also, make unit opacity taper more slowly than everything else
    result.a = mix(
        uOpacity,
        uOpacity *
            smoothstep(bounds.x, bounds.x + 0.1, vUv.x) *
            smoothstep(bounds.y, bounds.y + 0.1, vUv.y) *
            smoothstep(bounds.x, bounds.x + 0.1, 1.0 - vUv.x) *
            smoothstep(bounds.y, bounds.y + 0.1, 1.0 - vUv.y),
        uSoftEdges
    );

    gl_FragColor = result.rgba;

}
