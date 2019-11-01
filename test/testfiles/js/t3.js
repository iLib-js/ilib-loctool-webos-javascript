<SplitItem label={$L('DNS Server')}>{dns || ''}</SplitItem>
            title: $L('Style'),
            title: $L('No'),
<SettingsDivider>{$L({key:'pictureModeSettings', value:'Customize'})}</SettingsDivider>
        <Container className={css['labeled-picker-item']} role={'region'} aria-label={$L({key:'speaker_channel', value:'Channel'})}>
            return {
                'manual': $L('Custom'),
                'auto': $L({key:'digitalOptionSetByProgram', value:'Set By Program'})
            };