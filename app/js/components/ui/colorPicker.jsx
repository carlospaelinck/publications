import React from 'react'

const colors = [
  '#fff', '#f5f5f5', '#e0e0e0', '#bdbdbd', '#9e9e9e', '#757575',
  '#616161', '#424242', '#212121', '#000', '#d50000', '#f44336',
  '#e91e63', '#9c27b0', '#ba68c8', '#7e57c2', '#3f51b5', '#2196f3',
  '#90caf9', '#03A9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a',
  '#aeea00', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548'
]

export const ColorPicker = ({
  updateColor
}) => {
  const colorSwatches = colors.map((color, idx) => <div
    key={ `color-${idx}` }
    style={ { ...style.swatch, background: color } }
    onClick={ () => updateColor(color) }>
  </div>)

  return <div style={ styles.picker }>
    { colorSwatches }
  </div>
}

const styles = {
  picker: {
    position: 'absolute',
    width: '95%'
  },
  swatch: {
    display: 'inline-block',
    width: '24px',
    height: '24px'
  }
}
