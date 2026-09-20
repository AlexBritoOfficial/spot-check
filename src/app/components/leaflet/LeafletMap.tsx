"use client";

import dynamic from "next/dynamic";

const LeafLet = dynamic(() => import("./leaflet"), { ssr: false });

export default LeafLet;


const fileMessages: ModelMessage[] = [
	{
		role: ‘user’
		content: [
					{
						type: ‘reasoning’
						text: ‘The user is asking me how I am. How am I? Quite well.
					},
					{
						type: ‘text’,
						text:  ‘Quite Well, thank you’
					}
				]
	},
	{
		role: ‘assistant’
		content: [
					{
						type: ‘reasoning’
						text: ‘The user is asking me how I am. How am I? Quite well.
					},
					{
						type: ‘text’,
						text:  ‘Quite Well, thank you’
					}
				]
	
	}
]