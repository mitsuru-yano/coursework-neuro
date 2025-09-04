import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import { ContainerOutlet, CenteredLayout, Layout } from '@layout/index'

import { Login } from '@pages/login'
import { Register } from '@pages/register'
import { Homepage } from '@pages/homepage'
import { Heading } from '@ui/Heading'
import * as pages from '@pages'

const navLinks = [
    { label: 'Dashboard', url: 'dashboard', index: true, icon: '' },
    { label: 'Devices', url: 'devices', icon: '' },
    { label: 'Rooms', url: 'rooms', icon: '' },
    { label: 'Scenes', url: 'scenes', icon: '' },
    { label: 'Energy Usage', url: 'energy', icon: '' },
    { label: 'Security', url: 'security', icon: '' },
    { label: 'Cameras', url: 'cameras', icon: '' },
    { label: 'Climate Control', url: 'climate', icon: '' },
    { label: 'Lighting', url: 'lighting', icon: '' },
    { label: 'Schedules', url: 'schedules', icon: '' },
    { label: 'Notifications', url: 'notifications', icon: '' },
    { label: 'Users & Access', url: 'users', icon: '' },
    { label: 'Voice Control', url: 'voice', icon: '' },
    { label: 'Integrations', url: 'integrations', icon: '' },
    { label: 'Settings', url: 'settings', icon: '' },
]

const Router = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<CenteredLayout />}>
                    <Route path="/" element={<Homepage />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                </Route>
                <Route element={<Layout navLinks={navLinks} />}>
                    <Route element={<ContainerOutlet />}>
                        {navLinks.map(({ label, url, index }) => {
                            const Component = pages[label.replace(/ /g, '')]
                            return (
                                <Route
                                    key={url}
                                    index={index}
                                    path={url}
                                    element={Component ? <Component /> : <Heading>{label}</Heading>}
                                />
                            )
                        })}
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default Router
