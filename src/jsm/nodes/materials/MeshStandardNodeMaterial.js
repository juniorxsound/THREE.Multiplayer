import NodeMaterial from './NodeMaterial.js';
import {
	float, vec3, vec4, mix,
	materialRoughness, materialMetalness, materialColor, diffuseColor,
	metalness, roughness, specularColor
} from '../shadernode/ShaderNodeElements.js';
import getRoughness from '../functions/material/getRoughness.js';
import physicalLightingModel from '../functions/PhysicalLightingModel.js';

import { MeshStandardMaterial } from 'three';

const defaultValues = new MeshStandardMaterial();

export default class MeshStandardNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isMeshStandardNodeMaterial = true;

		this.colorNode = null;
		this.opacityNode = null;

		this.alphaTestNode = null;

		this.normalNode = null;

		this.emissiveNode = null;

		this.metalnessNode = null;
		this.roughnessNode = null;

		this.envNode = null;

		this.lightsNode = null;

		this.positionNode = null;

		this.setDefaultValues( defaultValues );

		this.setValues( parameters );

	}

	constructLightingModel( /*builder*/ ) {

		return physicalLightingModel;

	}

	constructVariants( builder, stack ) {

		// METALNESS

		const metalnessNode = this.metalnessNode ? float( this.metalnessNode ) : materialMetalness;

		stack.assign( metalness, metalnessNode );
		stack.assign( diffuseColor, vec4( diffuseColor.rgb.mul( metalnessNode.invert() ), diffuseColor.a ) );

		// ROUGHNESS

		let roughnessNode = this.roughnessNode ? float( this.roughnessNode ) : materialRoughness;
		roughnessNode = getRoughness.call( { roughness: roughnessNode } );

		stack.assign( roughness, roughnessNode );

		// SPECULAR COLOR

		const specularColorNode = mix( vec3( 0.04 ), materialColor.rgb, metalnessNode );

		stack.assign( specularColor, specularColorNode );

	}

	copy( source ) {

		this.colorNode = source.colorNode;
		this.opacityNode = source.opacityNode;

		this.alphaTestNode = source.alphaTestNode;

		this.normalNode = source.normalNode;

		this.emissiveNode = source.emissiveNode;

		this.metalnessNode = source.metalnessNode;
		this.roughnessNode = source.roughnessNode;

		this.envNode = source.envNode;

		this.lightsNode = source.lightsNode;

		this.positionNode = source.positionNode;

		return super.copy( source );

	}

}
