import { ShaderNode, max, abs, dFdx, dFdy, normalGeometry } from '../../shadernode/ShaderNodeBaseElements.js';

const getGeometryRoughness = new ShaderNode( () => {

	const dxy = max( abs( dFdx( normalGeometry ) ), abs( dFdy( normalGeometry ) ) );
	const geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );

	return geometryRoughness;

} );

export default getGeometryRoughness;
