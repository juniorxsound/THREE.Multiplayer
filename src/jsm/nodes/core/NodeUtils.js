import { Color, Matrix3, Matrix4, Vector2, Vector3, Vector4 } from 'three';

export const getCacheKey = ( object ) => {

	let cacheKey = '{';

	if ( object.isNode === true ) {

		cacheKey += `uuid:"${ object.uuid }",`;

	}

	for ( const property of getNodesKeys( object ) ) {

		cacheKey += `${ property }:${ object[ property ].getCacheKey() },`;

	}

	cacheKey += '}';

	return cacheKey;

};

export const getNodesKeys = ( object ) => {

	const props = [];

	for ( const name in object ) {

		const value = object[ name ];

		if ( value && value.isNode === true ) {

			props.push( name );

		}

	}

	return props;

};

export const getValueType = ( value ) => {

	if ( typeof value === 'number' ) {

		return 'float';

	} else if ( typeof value === 'boolean' ) {

		return 'bool';

	} else if ( value && value.isVector2 === true ) {

		return 'vec2';

	} else if ( value && value.isVector3 === true ) {

		return 'vec3';

	} else if ( value && value.isVector4 === true ) {

		return 'vec4';

	} else if ( value && value.isMatrix3 === true ) {

		return 'mat3';

	} else if ( value && value.isMatrix4 === true ) {

		return 'mat4';

	} else if ( value && value.isColor === true ) {

		return 'color';

	}

	return null;

};

export const getValueFromType = ( type, ...params ) => {

	const last4 = type ? type.slice( - 4 ) : undefined;

	if ( type === 'color' ) {

		return new Color( ...params );

	} else if ( last4 === 'vec2' ) {

		return new Vector2( ...params );

	} else if ( last4 === 'vec3' ) {

		return new Vector3( ...params );

	} else if ( last4 === 'vec4' ) {

		return new Vector4( ...params );

	} else if ( last4 === 'mat3' ) {

		return new Matrix3( ...params );

	} else if ( last4 === 'mat4' ) {

		return new Matrix4( ...params );

	} else if ( type === 'bool' ) {

		return false;

	} else if ( ( type === 'float' ) || ( type === 'int' ) || ( type === 'uint' ) ) {

		return 0;

	}

	return null;

};
