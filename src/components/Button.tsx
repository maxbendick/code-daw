import styled from 'styled-components'

export const Button = styled.button`
  height: 28px;
  width: 50px;
  background: #222;
  border: 1px solid #000;
  color: #ccc;
  outline: none;
  :active {
    border: 1px solid #11a;
  }
  :disabled {
    color: #777;
  }
`
