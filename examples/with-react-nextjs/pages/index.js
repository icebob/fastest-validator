import React from "react";
import Validator from "fastest-validator";

class Index extends React.Component {
	render() {

		const v = new Validator();

		const schema = {
			multi: [
				{ type: "string", min: 3, max: 255 },
				{ type: "boolean" }
			]
		};

		return (
			<div>
				Multi schema validator: {v.validate({ multi: 'john' }, schema) === true ? 'yey!' : 'nope..'}
				<br />
				Failed Multi schema validator: {JSON.stringify(v.validate({ multi: 123 }, schema))}
			</div>
		);
	}
}

export default Index;