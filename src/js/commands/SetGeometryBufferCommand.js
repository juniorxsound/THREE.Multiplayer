import { Command } from '../Command.js';
import * as BufferGeometryUtils from "../../jsm/utils/BufferGeometryUtils.js";

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param attributeName string
 * @param newValue number, string, boolean or object
 * @constructor
 */
class SetGeometryBufferCommand extends Command {

	constructor( editor, object, attributeName, newValue ) {

		super( editor );

		this.type = 'SetGeometryBufferCommand';
		this.name = `Set Geometry.${attributeName}`;


		this.thresh = newValue.value;

		this.object = object;
		this.attributeName = attributeName;
		// this.oldValue = ( object !== undefined ) ? object.geometry[ attributeName ] : undefined;
		// this.newValue = newValue;

	}

	execute() {
		//this.object.geometry[ this.attributeName ] = this.newValue;

		let classThis= this;

		this.object.traverse(
			function(child){

				if(child.geometry) {

					child.geometry = BufferGeometryUtils.mergeVertices(child.geometry, classThis.thresh);
					child.geometry.computeVertexNormals(true);

					//child.material = new THREE.MeshLambertMaterial( { color: 0x555555, side: THREE.DoubleSide } );
				}
			}
		);


		this.editor.signals.objectChanged.dispatch( this.object );
		this.editor.signals.geometryChanged.dispatch();
		this.editor.signals.sceneGraphChanged.dispatch();

	}

	undo() {

		//this.object.geometry[ this.attributeName ] = this.oldValue;


		this.editor.signals.objectChanged.dispatch( this.object );
		this.editor.signals.geometryChanged.dispatch();
		this.editor.signals.sceneGraphChanged.dispatch();

	}

	toJSON() {

		const output = super.toJSON( this );

		output.objectUuid = this.object.uuid;
		output.attributeName = this.attributeName;
		// output.oldValue = this.oldValue;
		// output.newValue = this.newValue;

		return output;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.object = this.editor.objectByUuid( json.objectUuid );
		this.attributeName = json.attributeName;
		// this.oldValue = json.oldValue;
		// this.newValue = json.newValue;

	}

}

export { SetGeometryBufferCommand };
