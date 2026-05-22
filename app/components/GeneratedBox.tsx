import { GeneratedBoxProps } from '../utils/spec';

// Created from drag interaction in Spacial Grid
export default function GeneratedBox({ props } : { props : GeneratedBoxProps }) {
  return (
    <div
      className='bg-emptycomponent'
      style={{
        gridColumn: `${props.colStart} / ${props.colEnd + 1}`,
        gridRow: `${props.rowStart} / ${props.rowEnd + 1}`
      }}
    >

    </div>
  );
}