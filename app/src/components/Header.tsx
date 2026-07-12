function Header() {
    return (
        <header
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '16px',
                borderBottom: '1px solid var(--panel-border)',
                marginBottom: '28px',
            }}
        >
            <div>
                <h1>Spectrophotometer Output Visualiser & Analyzer</h1>
            </div>
        </header>
    );
}

export default Header;

