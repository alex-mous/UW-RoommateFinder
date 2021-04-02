const handler = async (event, context) => {
    console.log(context.clientContext)
    return {
        statusCode: 200,
        body: JSON.stringify({success: true})
    }
}

module.exports = { handler }