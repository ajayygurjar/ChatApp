
const MediaMessage = ({ fileUrl, fileType, fileName }) => {
    if (!fileUrl) return null

    if (fileType?.startsWith('image/')) {
        return (
            <a href={fileUrl} target="_blank" rel="noreferrer">
                <img
                    src={fileUrl}
                    alt={fileName}
                    style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, display: 'block' }}
                />
            </a>
        )
    }

    if (fileType?.startsWith('video/')) {
        return (
            <video controls style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }}>
                <source src={fileUrl} type={fileType} />
            </video>
        )
    }

    return (
        <a href={fileUrl} target="_blank" rel="noreferrer"
            style={{ color: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 20 }}>📎</span>
            <span style={{ fontSize: 13, textDecoration: 'underline' }}>{fileName}</span>
        </a>
    )
}

export default MediaMessage