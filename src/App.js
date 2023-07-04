import { useState } from "react";
import axios from 'axios';
import { NFTStorage } from "nft.storage";

const App = () => {

  const [prompt, setPrompt] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [notsent, setNotSent] = useState(false);

  //console.log(prompt)

  const [imageBlob, setImageBlob] = useState(null)
  const [file, setFile] = useState(null)

const generateArt = async () => {
	try {
		setLoading(true);
		
		const response = await axios.post(
			`https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5`,
			{
				headers: {
					Authorization: `Bearer ${process.env.REACT_APP_HUGGING_FACE}}`,
				},
				method: "POST",
				inputs: prompt,
			},
			{ responseType: "blob" }
		);
		// convert blob to a image file type
		//setPrompt("");
		const file = new File([response.data], "image.png", {
			type: "image/png",
		});
		// saving the file in a state
		setFile(file);
		//setPrompt("");
		const url = URL.createObjectURL(response.data);
		setImageBlob(url);
		setLoading(false);
	} catch (err) {
		console.log(err);
	}
};

const cleanupIPFS = (url) => {
  if(url.includes("ipfs://")) {
    return url.replace("ipfs://", "https://ipfs.io/ipfs/")
  }
}


const uploadArtToIpfs = async () => {
  try {

    const nftstorage = new NFTStorage({
			token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEFCODJjNTgwQTJjNGU5ZmFBNDZBZkJlNDU5OTgyZmMyNGNEYjU0NzkiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY4ODQ2NDI2ODM5MywibmFtZSI6IkRlbW8ifQ.DnJ3fq5ru59WNvzRGJEyItsRilfcwulG2cKAO6I4CdQ",
		})

    const store = await nftstorage.store({
      name: "AI NFT",
      description: "AI generated NFT",
      image: file
    })
    //console.log("done");
    return cleanupIPFS(store.data.image.href)
  } catch(err) {
    console.log(err)
  }
}

const mintNft = async () => {
	try {
		setNotSent(true);
		const imageURL = await uploadArtToIpfs();

		// mint as an NFT on nftport
		const response = await axios.post(
			`https://api.nftport.xyz/v0/mints/easy/urls`,
			{
				file_url: imageURL,
				chain: "polygon",
				name: "Sample NFT",
				description: "Build with NFTPort!",
				mint_to_address: address,
			},
      {
        headers: {
          Authorization: 'e4b76b6e-4bc2-4ed8-8638-d8b6ac5a9402',
        }
      }
		);
		const data = await response.data;
		//console.log(data);
		setNotSent(false);
		window.location.reload();
		setAddress("");
	} catch (err) {
		console.log(err);
	}
};


return (
	<div className="flex flex-col items-center justify-center min-h-screen gap-4">
		<h1 className="text-4xl font-extrabold">AI Art Gasless mints</h1>
    <div className="flex flex-col items-center justify-center">
      {/* Create an input box and button saying next beside it */}
      <div className="flex items-center justify-center gap-4">
        <input
          className="border-2 border-black rounded-md p-2 leading-8 my-4"
          onChange={(e) => setPrompt(e.target.value)}
          type="text"
          placeholder="Enter a prompt"
        />
		{loading ? (
			<div>
				<button disabled className="bg-black text-white rounded-md p-2">
					Loading...
				</button>
			</div>
		):(
			<div>
				<button onClick={generateArt} className="bg-black text-white rounded-md p-2">GENERATE</button> 
			</div>
		)}
         
      </div>
      {imageBlob && (
	<div className="flex flex-col gap-4 items-center justify-center">
		<img src={imageBlob} alt="AI generated art" />
    <input
      className="border-2 border-black rounded-md p-2 leading-8 my-4"
      onChange={(e) => setAddress(e.target.value)}
      type="text"
      placeholder="Enter an Address"
    />
		{notsent ? (
			<button disabled className="bg-black text-white rounded-md p-2">
			SENDING...
		</button>
		):(
			<button onClick={mintNft} className="bg-black text-white rounded-md p-2">
				SEND GIFT
			</button>
		)}
		
	</div>
)}
    </div>
	</div>
);

}

export default App;
