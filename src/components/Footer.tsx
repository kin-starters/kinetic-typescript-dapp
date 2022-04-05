import { FC } from 'react';
import Logo from '../assets/svg/kin.svg'


export const Footer: FC = () => {
    return (
        <div className="">
            <footer className="mx-auto  flex flex-row p-2 text-center items-center footer bg-neutral text-neutral-content">
           
                <div className="max-w-md mx-auto grid-flow-col text-center">
                    <div>
                        <p className="text-white text-base font-light cursor-default ">
                            Powered by
                        </p>
                        <a
                            rel="noreferrer"
                            href="https://developer.kin.org/"
                            target="_blank"
                            className="text-white text-base font-bold hover:text-primary-dark transition-all duration-200"
                        >
                        <Logo className="LogoFooter"/>
                        </a>
                    </div>
                    
                </div>
            
            </footer>
        </div>
    );
};
