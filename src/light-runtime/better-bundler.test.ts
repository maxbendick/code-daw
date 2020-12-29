import '@testing-library/jest-dom'

/*

Try using object urls

https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications#Example_Using_object_URLs_to_display_images

https://developer.mozilla.org/en-US/docs/Web/API/File/File

*/

test.skip('exploring', async () => {
  const url = URL.createObjectURL(
    new File(['export const c = 5'], 'myfile.js', {
      type: 'text/javascript',
    }),
  )

  const myModule = await import(url)

  const response = await fetch(url)
  const text = await response.text()

  // these work in-browser
  expect(myModule.c).toEqual(5)
  expect(text).toEqual('the content')
})
