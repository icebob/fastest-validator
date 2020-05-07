import React from "react";
import Validator from "../../../dist/index";

const v = new Validator();

const schema = {
	multi: [
		{ type: "string", min: 3, max: 255 },
		{ type: "boolean" }
	]
};

const check = v.compile(schema)

class Index extends React.Component {
	render() {
		return (
			<div>
				Multi schema validator: {check({ multi: 'john' }) === true ? 'yey!' : 'nope..'}
				<br />
				Failed Multi schema validator: {JSON.stringify(check)}
			</div>
		);
	}
}

export default Index;
