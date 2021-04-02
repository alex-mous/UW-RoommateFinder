
exports.handler = async (ev, ct) => {
    return {
        statusCode: 200,
        body: JSON.stringify({success: true, data: { ev: ev, ct: ct}})
    }
}