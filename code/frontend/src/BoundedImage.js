import {useRef, useEffect} from 'react' 

const devBoundingBoxes = [{
                        "Width": 0.11086395382881165,
                        "Height": 0.10271988064050674,
                        "Left": 0.10355594009160995,
                        "Top": 0.5354844927787781
                    }]
const BoundedImage = function (props) {

    const canvasRef = useRef(null)

    useEffect(()=>{
        let img = new Image()
        img.src = props.url
        let ctx = canvasRef.current?.getContext('2d')
        let cHeight = canvasRef.current?.height;
        let cWidth = canvasRef.current?.width;
        ctx.drawImage(img,0,0,cWidth,cHeight)
        let instances = JSON.parse(props.boxes)
        for(let instance of instances){
            let box = instance["BoundingBox"]
            ctx.beginPath();
            ctx.rect(cWidth*box.Left, cHeight*box.Top, cWidth*box.Width, cHeight*box.Height)
            ctx.strokeStyle = "red";
            ctx.stroke()
        }
    },[])

    return (
        <canvas ref={canvasRef} width={1000} height={500} style={{width:"100%", height:"100%"}}>
            
        </canvas>
    )
}

export default BoundedImage;